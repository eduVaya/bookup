using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Bookup.Api.DTOs;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using MySqlConnector;
using BCryptNet = BCrypt.Net.BCrypt;

namespace Bookup.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly string _connectionString;
        private readonly IConfiguration _configuration;

        public AuthController(string connectionString, IConfiguration configuration)
        {
            _connectionString = connectionString;
            _configuration = configuration;
        }

        [HttpPost("signup")]
        public async Task<IActionResult> Signup(SignupRequest request)
        {
            await using var connection = new MySqlConnection(_connectionString);
            await connection.OpenAsync();

            var checkQuery = "SELECT COUNT(*) FROM users WHERE email = @Email";
            await using (var checkCmd = new MySqlCommand(checkQuery, connection))
            {
                checkCmd.Parameters.AddWithValue("@Email", request.Email);
                var count = Convert.ToInt32(await checkCmd.ExecuteScalarAsync());
                if (count > 0)
                {
                    return Conflict(new { error = "Email already registered" });
                }
            }

            var passwordHash = BCryptNet.HashPassword(request.Password);
            var insertQuery =
                @"INSERT INTO users (username, email, password_hash, status_id)
                                VALUES (@Username, @Email, @PasswordHash, 1)";
            await using (var insertCmd = new MySqlCommand(insertQuery, connection))
            {
                insertCmd.Parameters.AddWithValue("@Username", request.Username);
                insertCmd.Parameters.AddWithValue("@Email", request.Email);
                insertCmd.Parameters.AddWithValue("@PasswordHash", passwordHash);
                await insertCmd.ExecuteNonQueryAsync();

                var userId = insertCmd.LastInsertedId;

                return CreatedAtAction(
                    nameof(Signup),
                    new { id = userId },
                    new { message = "User created", userId }
                );
            }
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login(LoginRequest request)
        {
            await using var connection = new MySqlConnection(_connectionString);
            await connection.OpenAsync();

            var query =
                "SELECT id, username, email, password_hash FROM users WHERE email = @Email LIMIT 1";
            await using var cmd = new MySqlCommand(query, connection);
            cmd.Parameters.AddWithValue("@Email", request.Email);

            await using var reader = await cmd.ExecuteReaderAsync();
            if (!await reader.ReadAsync())
            {
                return Unauthorized(new { error = "Invalid credentials" });
            }

            var id = reader.GetInt32("id");
            var username = reader.GetString("username");
            var email = reader.GetString("email");
            var passwordHash = reader.GetString("password_hash");

            if (!BCryptNet.Verify(request.Password, passwordHash))
            {
                return Unauthorized(new { error = "Invalid credentials" });
            }

            var claims = new[]
            {
                new Claim(JwtRegisteredClaimNames.Sub, id.ToString()),
                new Claim(JwtRegisteredClaimNames.Email, email),
                new Claim("username", username),
            };

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]!));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: _configuration["Jwt:Issuer"],
                audience: null,
                claims: claims,
                expires: DateTime.Now.AddHours(2),
                signingCredentials: creds
            );

            var tokenString = new JwtSecurityTokenHandler().WriteToken(token);

            return Ok(new { token = tokenString });
        }
    }
}
