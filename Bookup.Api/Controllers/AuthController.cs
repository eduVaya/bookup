// For generating JWT tokens
// For creating and managing token claims
// For Encoding.UTF8.GetBytes when creating the signing key
using Bookup.Api.DTOs; // For SignupRequest, LoginRequest, SignupResponse, LoginResponse
using Bookup.Api.Services; // For AuthService
using Microsoft.AspNetCore.Mvc; // For ControllerBase, ApiController, IActionResult, etc.
// For SymmetricSecurityKey and SigningCredentials
using BCryptNet = BCrypt.Net.BCrypt; // Alias for the BCrypt.Net library (password hashing)

namespace Bookup.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly AuthService _authService;
        private readonly IConfiguration _configuration;

        public AuthController(AuthService authService, IConfiguration configuration)
        {
            _authService = authService;
            _configuration = configuration;
        }

        [HttpPost("signup")]
        public async Task<IActionResult> Signup(SignupRequest request)
        {
            var user = await _authService.SingupAsync(
                request.Username,
                request.Email,
                request.Password
            );
            if (user == null)
                return Conflict(new { error = "Email already registered" });

            var response = new SignupResponse { Message = "User created", UserId = user.Id };

            return CreatedAtAction(nameof(Signup), new { id = user.Id }, response);
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login(LoginRequest request)
        {
            var user = await _authService.LoginAsync(request.Email);
            if (user == null || !BCryptNet.Verify(request.Password, user.Value.PasswordHash))
                return Unauthorized(new { error = "Invalid credentials" });

            var token = JwtHelper.GenerateToken(
                user.Value.Id,
                user.Value.Email,
                user.Value.Username,
                _configuration
            );

            return Ok(
                new LoginResponse
                {
                    Token = token,
                    UserId = user.Value.Id,
                    Username = user.Value.Username,
                    Email = user.Value.Email,
                }
            );
        }
    }
}
