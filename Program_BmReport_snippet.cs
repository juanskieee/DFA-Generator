// ---- Add to Program.cs DI registrations ----
// Place alongside the other repository/service registrations already in your Program.cs.

builder.Services.AddScoped<MachineKarte.Web.Repositories.BmReportRepository>();
builder.Services.AddScoped<MachineKarte.Web.Services.BmReportService>();
