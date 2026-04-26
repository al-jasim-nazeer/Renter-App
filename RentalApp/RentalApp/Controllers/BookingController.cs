using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RentalApp.Data;
using RentalApp.Models;
using System.Security.Claims;
using System.Linq;

namespace RentalApp.Controllers
{
    public class BookingRequestDTO {
        public int PropertyId { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
    }

    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class BookingController : ControllerBase
    {
        private readonly AppDbContext _context;

        public BookingController(AppDbContext context)
        {
            _context = context;
        }

        private bool IsAuthorizedFor(params string[] roles)
        {
            var role = User.FindFirst(ClaimTypes.Role)?.Value 
                       ?? User.FindFirst("role")?.Value 
                       ?? User.Claims.FirstOrDefault(c => c.Type.EndsWith("role"))?.Value;
            
            if (string.IsNullOrEmpty(role)) return false;
            return roles.Any(r => r.Equals(role, StringComparison.OrdinalIgnoreCase));
        }

        [HttpPost]
        public IActionResult CreateBooking([FromBody] BookingRequestDTO dto)
        {
            if (!IsAuthorizedFor("Renter", "Tenant")) return StatusCode(403);

            var email = User.FindFirst(ClaimTypes.Name)?.Value ?? User.Claims.FirstOrDefault(c => c.Type.EndsWith("name"))?.Value;
            var user = _context.Users.FirstOrDefault(u => u.Email == email);

            if (user == null)
                return Unauthorized();

            var booking = new Booking
            {
                PropertyId = dto.PropertyId,
                RenterId = user.Id,
                StartDate = dto.StartDate,
                EndDate = dto.EndDate,
                Status = "Pending"
            };

            _context.Bookings.Add(booking);
            _context.SaveChanges();

            return Ok("Booking request sent");
        }

        [HttpPut("{id}/approve")]
        public IActionResult Approve(int id)
        {
            if (!IsAuthorizedFor("Owner", "Admin")) return StatusCode(403);

            var booking = _context.Bookings.Find(id);
            if (booking == null) return NotFound();

            booking.Status = "Confirmed";
            _context.SaveChanges();

            return Ok("Booking approved");
        }

        [HttpPut("{id}/reject")]
        public IActionResult Reject(int id)
        {
            if (!IsAuthorizedFor("Owner", "Admin")) return StatusCode(403);

            var booking = _context.Bookings.Find(id);
            if (booking == null) return NotFound();

            booking.Status = "Rejected";
            _context.SaveChanges();

            return Ok("Booking rejected");
        }
    }
}