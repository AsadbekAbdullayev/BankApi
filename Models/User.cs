namespace BankApi.Models
{
    // Foydalanuvchi ma'lumotlar modeli
    public class User
    {
        // uint > 0->32ming faqat musbat
        // Ma'lumotlar bazasida noyob identifikator
        public int Id { get; set; }
        
        // Foydalanuvchi ismi
        public required string Name { get; set; }
        
        // Email manzili
        public required string Email { get; set; }
        
        // Telefon raqami
        public required string Phone { get; set; }
    }
}
