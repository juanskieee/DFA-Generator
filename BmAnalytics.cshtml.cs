using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using MachineKarte.Web.Models;
using MachineKarte.Web.Services;

namespace MachineKarte.Web.Pages;

public class BmAnalyticsModel : PageModel
{
    private readonly BmAnalyticsService _svc;
    private readonly IConfiguration     _cfg;

    public BmAnalyticsModel(BmAnalyticsService svc, IConfiguration cfg)
    {
        _svc = svc;
        _cfg = cfg;
    }

    public string AppVersion => _cfg["AppVersion"] ?? "1.0";

    // -----------------------------------------------------------------------
    // GET /BmAnalytics  – serves the page shell; grid is loaded via AJAX
    // -----------------------------------------------------------------------
    public IActionResult OnGet() => Page();

    // -----------------------------------------------------------------------
    // POST /BmAnalytics?handler=LoadGrid
    // Body: { dateFrom, dateTo, mode }
    // Returns: AjaxResult<BmAnalyticsResult>
    // -----------------------------------------------------------------------
    public async Task<IActionResult> OnPostLoadGridAsync([FromBody] BmAnalyticsRequest req)
    {
        try
        {
            var result = await _svc.BuildGridAsync(req);
            return new JsonResult(AjaxResult<BmAnalyticsResult>.Ok(result));
        }
        catch (Exception ex)
        {
            return new JsonResult(AjaxResult<object>.Fail(ex.Message));
        }
    }

    // -----------------------------------------------------------------------
    // GET /BmAnalytics?handler=CellMachines&key=DC_1
    // Returns the machine list for a specific cell (for the flyout panel).
    // We re-run a light query rather than caching the full result server-side.
    // -----------------------------------------------------------------------
    public async Task<IActionResult> OnGetCellMachinesAsync(
        string key, string dateFrom, string dateTo, string mode)
    {
        try
        {
            var req    = new BmAnalyticsRequest { DateFrom = dateFrom, DateTo = dateTo, Mode = mode };
            var result = await _svc.BuildGridAsync(req);

            if (result.Cells.TryGetValue(key, out var cell))
                return new JsonResult(AjaxResult<List<string>>.Ok(cell.Mcnos));

            return new JsonResult(AjaxResult<List<string>>.Ok([]));
        }
        catch (Exception ex)
        {
            return new JsonResult(AjaxResult<object>.Fail(ex.Message));
        }
    }
}
