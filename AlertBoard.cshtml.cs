using System;
using System.Collections.Generic;
using System.Text.Json;
using System.Threading.Tasks;
using MachineKarte.Web.Models;
using MachineKarte.Web.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace MachineKarte.Web.Pages
{
    public class AlertBoardModel : PageModel
    {
        private readonly AlertBoardService _svc;

        // Transient board cache — stored in TempData as JSON between the
        // LoadBoard POST and the Drilldown GET so we avoid re-querying SQL.
        private const string BoardCacheKey = "AlertBoardCache";

        public AlertBoardModel(AlertBoardService svc) => _svc = svc;

        // ─── Page GET ─────────────────────────────────────────────────────────

        public void OnGet() { }

        // ─── AJAX: load full board ─────────────────────────────────────────────
        // POST /AlertBoard?handler=LoadBoard
        // Body: { dateFrom, dateTo, user }

        public async Task<IActionResult> OnPostLoadBoardAsync([FromBody] AlertBoardRequest req)
        {
            try
            {
                var board = await _svc.LoadBoardAsync(req);

                // Cache serialised board in TempData for Drilldown calls
                TempData[BoardCacheKey] = JsonSerializer.Serialize(board);
                TempData.Keep(BoardCacheKey);

                return new JsonResult(AjaxResult.Ok(board));
            }
            catch (Exception ex)
            {
                return new JsonResult(AjaxResult.Fail(ex.Message));
            }
        }

        // ─── AJAX: drilldown machine list ─────────────────────────────────────
        // GET /AlertBoard?handler=Drilldown&cellKey=DC_0

        public IActionResult OnGetDrilldownAsync(string cellKey)
        {
            try
            {
                TempData.Keep(BoardCacheKey);
                var json = TempData[BoardCacheKey] as string;
                if (string.IsNullOrEmpty(json))
                    return new JsonResult(AjaxResult.Fail("Board data not in cache — reload first."));

                var board    = JsonSerializer.Deserialize<AlertBoardData>(json)!;
                var (machines, title) = _svc.GetDrilldown(board, cellKey);

                return new JsonResult(AjaxResult.Ok(new { machines, title }));
            }
            catch (Exception ex)
            {
                return new JsonResult(AjaxResult.Fail(ex.Message));
            }
        }
    }
}
