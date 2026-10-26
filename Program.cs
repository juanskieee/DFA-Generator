// Program.cs — MachineKarte.Web (E-Karte System)
// ASP.NET Core 7/8 minimal hosting model

using MachineKarte.Web.Repositories;
using MachineKarte.Web.Services;
using MachineKarte.Web.Services.Reporting;

var builder = WebApplication.CreateBuilder(args);

// ── Services ─────────────────────────────────────────────
builder.Services.AddRazorPages();

// Monitoring (Form1)
builder.Services.AddScoped<MonitoringRepository>();
builder.Services.AddScoped<MonitoringService>();

// Evidence Making (Form4)
builder.Services.AddScoped<EvidenceRepository>();
builder.Services.AddScoped<EvidenceMakingService>();

// Action Cards (Form_Input)
builder.Services.AddScoped<ActionCardRepository>();
builder.Services.AddScoped<ActionCardService>();

// Raw Data (Form5)
builder.Services.AddScoped<RawDataRepository>();
builder.Services.AddScoped<RawDataService>();

// OCAP Viewer (Form6)
builder.Services.AddScoped<OcapViewerRepository>();
builder.Services.AddScoped<OcapViewerService>();

// Anti-forgery (used by AJAX POST handlers)
builder.Services.AddAntiforgery(opts =>
{
    opts.HeaderName = "RequestVerificationToken";
});

var app = builder.Build();

// ── Middleware ───────────────────────────────────────────
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Error");
    app.UseHsts();
}

app.UseHttpsRedirection();

// Serve Assets/ folder as static files
app.UseStaticFiles();
app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new Microsoft.Extensions.FileProviders.PhysicalFileProvider(
        Path.Combine(builder.Environment.ContentRootPath, "Assets")),
    RequestPath = "/Assets"
});

app.UseRouting();
app.UseAntiforgery();
app.MapRazorPages();

// Serve TempData/GeneratedPdf/ so browser can preview/download evidence files
app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new Microsoft.Extensions.FileProviders.PhysicalFileProvider(
        Path.Combine(builder.Environment.ContentRootPath, "TempData", "GeneratedPdf")),
    RequestPath = "/TempData/GeneratedPdf"
});

// Default route → Monitoring dashboard
app.MapGet("/", context =>
{
    context.Response.Redirect("/Monitoring");
    return Task.CompletedTask;
});

app.Run();
