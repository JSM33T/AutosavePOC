namespace Autosave.Api.Entities
{
    public class AutosaveDataRequest
    {
        public int Id { get; set; }
        public required string Title { get; set; }
        public string? Description { get; set; }
        public bool IsAutosaved { get; set; }
    }
}
