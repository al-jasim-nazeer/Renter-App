using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RentalApp.Data;
using System.Security.Claims;
using System.Linq;

namespace RentalApp.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class AdminController : ControllerBase
    {
        private readonly AppDbContext _context;

        public AdminController(AppDbContext context)
        {
            _context = context;
        }

        private bool IsAdminOrOwner()
        {
            var role = User.FindFirst(ClaimTypes.Role)?.Value 
                       ?? User.FindFirst("role")?.Value 
                       ?? User.Claims.FirstOrDefault(c => c.Type.EndsWith("role"))?.Value;
            return role == "Admin" || role == "Owner" || role == "admin" || role == "owner";
        }

        private bool IsAdmin()
        {
            var role = User.FindFirst(ClaimTypes.Role)?.Value 
                       ?? User.FindFirst("role")?.Value 
                       ?? User.Claims.FirstOrDefault(c => c.Type.EndsWith("role"))?.Value;
            return role == "Admin" || role == "admin";
        }

        [HttpGet("users")]
        public IActionResult GetUsers()
        {
            if (!IsAdminOrOwner()) return StatusCode(403);
            return Ok(_context.Users.ToList());
        }

        [HttpGet("properties")]
        public IActionResult GetProperties()
        {
            if (!IsAdminOrOwner()) return StatusCode(403);
            return Ok(_context.Properties.ToList());
        }

        [HttpGet("bookings")]
        public IActionResult GetBookings()
        {
            if (!IsAdminOrOwner()) return StatusCode(403);
            return Ok(_context.Bookings.ToList());
        }

        [HttpDelete("users/{id}")]
        public IActionResult DeleteUser(int id)
        {
            if (!IsAdmin()) return StatusCode(403);
            var u = _context.Users.Find(id);
            if(u != null) { _context.Users.Remove(u); _context.SaveChanges(); }
            return Ok();
        }

        [HttpDelete("properties/{id}")]
        public IActionResult DeleteProperty(int id)
        {
            if (!IsAdminOrOwner()) return StatusCode(403);
            var p = _context.Properties.Find(id);
            if(p != null) { _context.Properties.Remove(p); _context.SaveChanges(); }
            return Ok();
        }

        [HttpDelete("bookings/{id}")]
        public IActionResult DeleteBooking(int id)
        {
            if (!IsAdminOrOwner()) return StatusCode(403);
            var b = _context.Bookings.Find(id);
            if(b != null) { _context.Bookings.Remove(b); _context.SaveChanges(); }
            return Ok();
        }
    }
}