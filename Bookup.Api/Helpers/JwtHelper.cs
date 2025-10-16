using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;

namespace Bookup.Api.Services
{
    public static class JwtHelper
    {
        public static string GenerateToken(int userId, string email, string username, IConfiguration configuration)
        {
            // Read secret key and issuer from appsettings.json
            var key = configuration["Jwt:Key"] ?? throw new Exception("JWT key not configured.");
            var issuer = configuration["Jwt:Issuer"] ?? "Bookup";

            // Create claims for the token payload
            var claims = new[]
            {
                new Claim(JwtRegisteredClaimNames.Sub, userId.ToString()),
                new Claim(JwtRegisteredClaimNames.Email, email),
                new Claim("username", username),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
            };

            // Create the key and credentials
            var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key));
            var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

            // Build the token
            var token = new JwtSecurityToken(
                issuer: issuer,
                audience: null,
                claims: claims,
                expires: DateTime.Now.AddHours(2),
                signingCredentials: credentials
            );

            // Return it as a string
            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}
