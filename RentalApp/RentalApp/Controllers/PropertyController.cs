using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RentalApp.Data;
using RentalApp.DTOs;
using RentalApp.Models;
using System.Security.Claims;

namespace RentalApp.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PropertyController : ControllerBase
    {
        private readonly AppDbContext _context;

        public PropertyController(AppDbContext context)
        {
            _context = context;
        }

        //  Only Owner can add property
        [Authorize(Roles = "Owner")]
        [HttpPost]
        public IActionResult AddProperty(PropertyDTO dto)
        {
            // get logged-in user email from token
            var email = User.FindFirst(ClaimTypes.Name)?.Value;

            var user = _context.Users.FirstOrDefault(u => u.Email == email);

            if (user == null)
                return Unauthorized();

            var property = new Property
            {
                Title = dto.Title,
                Description = dto.Description,
                Address = dto.Address,
                Price = dto.Price,
                PropertyType = dto.PropertyType,
                Bedrooms = dto.Bedrooms,
                Bathrooms = dto.Bathrooms,
                OwnerId = user.Id
            };

            _context.Properties.Add(property);
            _context.SaveChanges();

            return Ok("Property added successfully");
        }
        [HttpGet]
        public IActionResult GetAllProperties()
        {
            var properties = _context.Properties.ToList();
            return Ok(properties);
        }
        
        [HttpGet("search")]
        public IActionResult Search(string? location, decimal? minPrice, decimal? maxPrice)
        {
            var query = _context.Properties.AsQueryable();

            if (!string.IsNullOrEmpty(location))
                query = query.Where(p => p.Address.Contains(location));

            if (minPrice.HasValue)
                query = query.Where(p => p.Price >= minPrice);

            if (maxPrice.HasValue)
                query = query.Where(p => p.Price <= maxPrice);

            var result = query.ToList();

            if (!result.Any())
                return Ok("No properties found");

            return Ok(result);
        }
    }
}