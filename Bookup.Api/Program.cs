using System.Text;
using Bookup.Api.Data;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);

//JWT Config
var jwtKey = builder.Configuration["Jwt:Key"] ?? "super_secret_key_123!";
var jwtIssuer = builder.Configuration["Jwt:Issuer"] ?? "Bookup";

// Add services to the container.
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

builder.Services.AddControllers(); // Allows the app to use controllers (like HelloController)
builder.Services.AddEndpointsApiExplorer(); // Enables endpoint discovery (used by Swagger)
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseMySql(
        builder.Configuration.GetConnectionString("DefaultConnection"),
        ServerVersion.AutoDetect(builder.Configuration.GetConnectionString("DefaultConnection"))
    )
);

builder.Services.AddSingleton(builder.Configuration.GetConnectionString("DefaultConnection"));

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    // app.UseSwagger(); // Generates Swagger JSON
    // app.UseSwaggerUI(); // Provides a UI to test your API in the browser
}

app.UseHttpsRedirection();
app.UseAuthorization(); // Prepares authorization middleware (safe to leave, even if unused)

app.MapControllers(); // Maps all controllers (like HelloController) to their routes

app.Run();
