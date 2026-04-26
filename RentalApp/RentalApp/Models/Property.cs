namespace RentalApp.Models
{
    public class Property
    {
        public int Id { get; set; }

        public string Title { get; set; }

        public string Description { get; set; }

        public string Address { get; set; }

        public decimal Price { get; set; }

        public string PropertyType { get; set; }

        public int Bedrooms { get; set; }

        public int Bathrooms { get; set; }

        public int OwnerId { get; set; }
    }
}