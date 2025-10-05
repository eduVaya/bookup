using Bookup.Api.Models;
using Bookup.Api.Constants;

using MySqlConnector;
using BCryptNet = BCrypt.Net.BCrypt;

namespace Bookup.Api.Services
{
    public class AuthService
    {
        private readonly string _connectionString;

        public AuthService(string connectionString)
        {
            _connectionString = connectionString;
        }

        public async Task<User?> SingupAsync(string username, string email, string password)
        {
            await using var connection = new MySqlConnection(_connectionString);
            await connection.OpenAsync();

            var checkQuery = "SELECT COUNT(*) FROM users WHERE email = @Email";
            await using var checkCmd = new MySqlCommand(checkQuery, connection);
            checkCmd.Parameters.AddWithValue("@Email", email);
            var count = Convert.ToInt32(await checkCmd.ExecuteScalarAsync());

            if (count > 0)
            {
                return null;
            }

            var passwordHash = BCryptNet.HashPassword(password);
            var insertQuery =
                @"INSERT INTO users (username, email, password_hash, status_id)
                                VALUES (@Username, @Email, @PasswordHash, @StatusId)";
            await using (var insertCmd = new MySqlCommand(insertQuery, connection))
            {
                insertCmd.Parameters.AddWithValue("@Username", username);
                insertCmd.Parameters.AddWithValue("@Email", email);
                insertCmd.Parameters.AddWithValue("@PasswordHash", passwordHash);
                insertCmd.Parameters.AddWithValue("@StatusId", UserStatus.Active);

                await insertCmd.ExecuteNonQueryAsync();
                var user = new User
                {
                    Id = (int)insertCmd.LastInsertedId,
                    Username = username,
                    Email = email,
                    PasswordHash = passwordHash,
                    StatusId = UserStatus.Active,
                    CreatedAt = DateTime.Now,
                    UpdatedAt = DateTime.Now,
                };

                return user;
            }
        }

        public async Task<(int Id, string Username, string Email, string PasswordHash)?> LoginAsync(string email)
        {
            await using var connection = new MySqlConnection(_connectionString);
            await connection.OpenAsync();

            var query =
                "SELECT id, username, email, password_hash FROM users WHERE email = @Email LIMIT 1";
            await using var cmd = new MySqlCommand(query, connection);
            cmd.Parameters.AddWithValue("@Email", email);

            await using var reader = await cmd.ExecuteReaderAsync();
            if (!await reader.ReadAsync())
                return null;

            return (
                reader.GetInt32("id"),
                reader.GetString("username"),
                reader.GetString("email"),
                reader.GetString("password_hash")
            );
        }
    }
}
