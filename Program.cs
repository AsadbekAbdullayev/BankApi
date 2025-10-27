using BankApi.Services;

var builder = WebApplication.CreateBuilder(args);

// --- 1. Xizmatlarni Ro'yxatdan O'tkazish (DI) ---
// UserService-ni butun ilova uchun Singleton sifatida ro'yxatdan o'tkazish
builder.Services.AddSingleton<UserService>();

// CORS Siyosati uchun Nomi
const string MyAllowSpecificOrigins = "_myAllowSpecificOrigins";

// 1.1 CORS Xizmatini Ro'yxatdan O'tkazish
builder.Services.AddCors(options =>
{
    options.AddPolicy(name: MyAllowSpecificOrigins,
                      policy =>
                      {
                          // ** MUHIM: Bu yerda React ilovangiz ishlaydigan manzil bo'lishi kerak. **
                          // Odatda http://localhost:3000
                          policy.WithOrigins("http://localhost:5173") 
                                .AllowAnyHeader() 
                                .AllowAnyMethod(); // GET, POST, PUT, DELETE ga ruxsat berish
                      });
});


// Standart ASP.NET Core konfiguratsiyasi
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// --- 2. Middleware ni Sozlash ---

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// 2.1 CORS ni qo'shish (MUHIM!)
// app.UseHttpsRedirection() dan keyin va app.MapControllers() dan oldin chaqirilishi kerak.
app.UseCors(MyAllowSpecificOrigins); 

// Kontrollerlar (API Endpointlari) ishlatilishini yoqish
app.MapControllers();

app.Run();
