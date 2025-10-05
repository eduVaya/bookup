using Bookup.Api.Services; // For AuthService
using Microsoft.AspNetCore.Mvc; // Optional, but safe to keep for controller attributes

var builder = WebApplication.CreateBuilder(args);

// JWT config (you might still use this for JwtHelper)
var jwtKey = builder.Configuration["Jwt:Key"] ?? "super_secret_key_123!";
var jwtIssuer = builder.Configuration["Jwt:Issuer"] ?? "Bookup";

// Add services to the container
builder.Services.AddOpenApi();
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();

// Register custom services
builder.Services.AddScoped<AuthService>();

// Register connection string for manual SQL access
builder.Services.AddSingleton(builder.Configuration.GetConnectionString("DefaultConnection"));

var app = builder.Build();

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();
app.UseAuthorization();
app.MapControllers();

app.Run();
