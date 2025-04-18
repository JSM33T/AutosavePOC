using Autosave.Api.Entities;

namespace Autosave.Api.Repositories
{
    public interface IAutosaveRepository
    {
        public Task<int> UpsertAutosaveAsync(AutosaveData data);
        public Task<IEnumerable<AutosaveData>> GetAllAsync();
        public Task<AutosaveData?> GetByIdAsync(int id);
        public Task ClearAllAsync();
    }
}
