using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using MachineKarte.Web.Models;
using MachineKarte.Web.Services;

namespace MachineKarte.Web.Pages
{
    public class BmReportModel : PageModel
    {
        private readonly BmReportService _svc;
        private readonly ILogger<BmReportModel> _log;

        public BmReportModel(BmReportService svc, ILogger<BmReportModel> log)
        {
            _svc = svc;
            _log = log;
        }

        // Rendered page only needs these for breadcrumb / title
        [BindProperty(SupportsGet = true)]
        public int BmId { get; set; }

        [BindProperty(SupportsGet = true)]
        public string Process { get; set; } = "";

        // ------------------------------------------------------------------
        // GET /BmReport?bmId=123&process=TE  →  show a simple loading page
        // ------------------------------------------------------------------
        public IActionResult OnGet()
        {
            if (BmId <= 0)
                return BadRequest("bmId is required.");
            return Page();
        }

        // ------------------------------------------------------------------
        // POST /BmReport?handler=DownloadReport  →  stream the XLSX
        // ------------------------------------------------------------------
        public async Task<IActionResult> OnPostDownloadReportAsync(
            [FromForm] int bmId, [FromForm] string process)
        {
            try
            {
                var (bytes, fileName) = await _svc.GenerateAsync(bmId, process ?? "TE");
                return File(bytes,
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                    fileName);
            }
            catch (InvalidOperationException ex)
            {
                _log.LogWarning(ex, "BmReport: record not found bmId={BmId}", bmId);
                return new JsonResult(new AjaxResult
                {
                    Success = false,
                    Message = ex.Message
                });
            }
            catch (Exception ex)
            {
                _log.LogError(ex, "BmReport: generation failed bmId={BmId}", bmId);
                return new JsonResult(new AjaxResult
                {
                    Success = false,
                    Message = "Report generation failed. Check server logs."
                });
            }
        }

        // ------------------------------------------------------------------
        // GET /BmReport?handler=CheckRecord&bmId=123  →  quick existence check
        // ------------------------------------------------------------------
        public async Task<IActionResult> OnGetCheckRecordAsync(int bmId)
        {
            try
            {
                var (bytes, _) = await _svc.GenerateAsync(bmId, "TE");
                return new JsonResult(new AjaxResult { Success = true, Message = "OK" });
            }
            catch (Exception ex)
            {
                return new JsonResult(new AjaxResult { Success = false, Message = ex.Message });
            }
        }
    }
}
