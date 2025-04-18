using Autosave.Api.Entities;
using Autosave.Api.Repositories;
using Microsoft.AspNetCore.Mvc;

namespace Autosave.Api.Controllers
{
    [ApiController]
    [Route("api/autosave")]
    public class AutosaveController : ControllerBase
    {
        private readonly ILogger<AutosaveController> _logger;
        private readonly IAutosaveRepository _repo;

        public AutosaveController(ILogger<AutosaveController> logger, IAutosaveRepository repo)
        {
            _logger = logger;
            _repo = repo;
        }

        [HttpPost("save")]
        public async Task<IActionResult> Save([FromBody] AutosaveDataRequest request)
        {
            var data = new AutosaveData
            {
                Id = request.Id,
                Title = request.Title,
                Description = request.Description,
                IsAutosaved = request.IsAutosaved,
                DateCreated = DateTime.Now
            };

            var newId = await _repo.UpsertAutosaveAsync(data);
            return Ok(new { id = newId });
        }


        [HttpGet("get")]
        public async Task<IActionResult> GetAll()
        {
            var records = await _repo.GetAllAsync();
            return Ok(records);
        }

        [HttpGet("getbyid")]
        public async Task<IActionResult> Get([FromQuery] int id)
        {
            var data = await _repo.GetByIdAsync(id);
            if (data == null) return NotFound();
            return Ok(data);
        }

        [HttpGet("clearall")]
        public async Task<IActionResult> ClearAll()
        {
            await _repo.ClearAllAsync();
            return Ok("Done");
        }

    }
}
