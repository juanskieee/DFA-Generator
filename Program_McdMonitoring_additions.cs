// ── Add these two lines to Program.cs alongside the existing DI registrations ──

// Form7 – MCD Monitoring
builder.Services.AddScoped<MachineKarte.Web.Repositories.McdMonitoringRepository>();
builder.Services.AddScoped<MachineKarte.Web.Services.McdMonitoringService>();
