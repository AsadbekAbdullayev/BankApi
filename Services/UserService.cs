using BankApi.Models;
using System.Collections.Concurrent;

namespace BankApi.Services
{
    // Haqiqiy ma'lumotlar bazasini simulyatsiya qilish uchun Service qatlami
    public class UserService
    {
        // ConcurrentDictionary ma'lumotlarni xotirada xavfsiz saqlash uchun
        private readonly ConcurrentDictionary<int, User> _users = new ConcurrentDictionary<int, User>();
        private int _nextId = 3;

        public UserService()
        {
            // Boshlang'ich ma'lumotlarni yuklashda ENDI ID li User obyektini ishlatamiz.
            _users.TryAdd(1, new User { Id = 1, Name = "Alijon Sobirov", Email = "ali@example.com", Phone = "998901234567" });
            _users.TryAdd(2, new User { Id = 2, Name = "Madina Karimova", Email = "madina@example.com", Phone = "998917654321" });
            _nextId = 3; 
        }

        // Barcha foydalanuvchilarni olish (READ ALL)
        public IEnumerable<User> GetAll()
        {
            return _users.Values.OrderBy(u => u.Id);
        }

        // Yangi foydalanuvchi qo'shish (CREATE)
        // **TUZAILDI**: Endi to'g'ridan-to'g'ri UserPayload emas, balki to'liq User modelini qabul qiladi.
        // ID ni Controller beradi
        public User Add(UserCreateUpdatePayload payload)
        {
            // Yangi ID berish
            int newId = Interlocked.Increment(ref _nextId);
            
            var newUser = new User
            {
                Id = newId,
                Name = payload.Name,
                Email = payload.Email,
                Phone = payload.Phone
            };
            
            _users[newId] = newUser;
            return newUser;
        }


        // Foydalanuvchini tahrirlash (UPDATE)
        public bool Update(int id, UserCreateUpdatePayload payload)
        {
            if (_users.TryGetValue(id, out var existingUser))
            {
                var updatedUser = new User
                {
                    Id = id,
                    Name = payload.Name,
                    Email = payload.Email,
                    Phone = payload.Phone
                };
                
                // Ma'lumotni yangilash
                _users[id] = updatedUser; 
                return true;
            }
            return false;
        }

        // Foydalanuvchini o'chirish (DELETE)
        public bool Delete(int id)
        {
            return _users.TryRemove(id, out _);
        }
    }
}
