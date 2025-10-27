using BankApi.Models;
using BankApi.Services;
using Microsoft.AspNetCore.Mvc;

namespace BankApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")] // Manzil: /api/users
    public class UsersController : ControllerBase
    {
        private readonly UserService _userService;

        // Dependency Injection (UserService ni qabul qilish)
        public UsersController(UserService userService)
        {
            _userService = userService;
        }

        // GET: /api/users - Barcha foydalanuvchilarni olish (READ ALL)
        [HttpGet]
        public ActionResult<IEnumerable<User>> GetUsers()
        {
            return Ok(_userService.GetAll());
        }

        // POST: /api/users - Yangi foydalanuvchi yaratish (CREATE)
        [HttpPost]
        public ActionResult<User> CreateUser(UserCreateUpdatePayload payload)
        {
            var newUser = _userService.Add(payload);
            
            // 201 Created holat kodi va yangi obyektga yo'naltirish
            return CreatedAtAction(nameof(GetUsers), new { id = newUser.Id }, newUser);
        }

        // PUT: /api/users/{id} - Foydalanuvchini tahrirlash (UPDATE)
        [HttpPut("{id}")]
        public IActionResult UpdateUser(int id, UserCreateUpdatePayload payload)
        {
            if (!_userService.Update(id, payload))
            {
                // Agar foydalanuvchi topilmasa
                return NotFound();
            }

            // 204 No Content (muvaffaqiyatli yangilanish, ammo javobda kontent yo'q)
            return NoContent();
        }

        // DELETE: /api/users/{id} - Foydalanuvchini o'chirish (DELETE)
        [HttpDelete("{id}")]
        public IActionResult DeleteUser(int id)
        {
            if (!_userService.Delete(id))
            {
                // Agar foydalanuvchi topilmasa
                return NotFound();
            }

            // 204 No Content
            return NoContent();
        }
    }
}
