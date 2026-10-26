// Pages/RawData.cshtml.cs
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using MachineKarte.Web.Models;
using MachineKarte.Web.Services;

namespace MachineKarte.Web.Pages
{
    public class RawDataModel : PageModel
    {
        private readonly RawDataService _service;
        private readonly ILogger<RawDataModel> _logger;

        // Bound from the query string when the page is opened directly,
        // e.g. /RawData?Process=DC&Location=Line1&DateFrom=2024-01-01&DateTo=2024-12-31
        [BindProperty(SupportsGet = true)]
        public string Process  { get; set; } = string.Empty;

        [BindProperty(SupportsGet = true)]
        public string Location { get; set; } = string.Empty;

        [BindProperty(SupportsGet = true)]
        public string Machine  { get; set; } = string.Empty;

        [BindProperty(SupportsGet = true)]
        public string DateFrom { get; set; } = string.Empty;

        [BindProperty(SupportsGet = true)]
        public string DateTo   { get; set; } = string.Empty;

        public RawDataModel(RawDataService service, ILogger<RawDataModel> logger)
        {
            _service = service;
            _logger  = logger;
        }

        // ── Initial page load ────────────────────────────────────────────────
        public void OnGet() { /* Parameters stored in bound properties */ }

        // ── AJAX: load all data ──────────────────────────────────────────────
        // Called by RawData.js on DOMContentLoaded (or when the parent passes params).
        public IActionResult OnGetLoadDataAsync(
            string process, string location, string machine,
            string dateFrom, string dateTo)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(process)  ||
                    string.IsNullOrWhiteSpace(location) ||
                    string.IsNullOrWhiteSpace(dateFrom) ||
                    string.IsNullOrWhiteSpace(dateTo))
                {
                    return new JsonResult(AjaxResult<RawDataResult>.Fail(
                        "Required parameters missing (process, location, dateFrom, dateTo)."));
                }

                var req = new RawDataRequest
                {
                    Process  = process,
                    Location = location,
                    Machine  = machine,
                    DateFrom = dateFrom,
                    DateTo   = dateTo
                };

                var data = _service.Load(req);
                return new JsonResult(AjaxResult<RawDataResult>.Ok(data));
            }
            catch (ArgumentException ex)
            {
                _logger.LogWarning(ex, "Invalid parameter in RawData request.");
                return new JsonResult(AjaxResult<RawDataResult>.Fail(ex.Message));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error loading raw data.");
                return new JsonResult(AjaxResult<RawDataResult>.Fail(
                    "An unexpected error occurred while loading data."));
            }
        }
    }
}
