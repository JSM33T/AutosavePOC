namespace Autosave.Api.Entities
{
    public class AutosaveData
    {
        public int Id { get; set; }
        public required string Title { get; set; }
        public string? Description { get; set; }
        public DateTime DateCreated { get; set; }
        public int Hits { get; set; }
        public bool IsAutosaved { get; set; }
    }
}
