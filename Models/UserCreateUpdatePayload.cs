namespace BankApi.Models // bu url-> shu UserCreateUpdatePayload clasini url.
{
    // API orqali keladigan ma'lumotlar uchun model (Payload)
    public class UserCreateUpdatePayload
    {
        public required string Name { get; set; }
        public required string Email { get; set; }
        public required string Phone { get; set; }
    }
}
