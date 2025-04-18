using Autosave.Api.Entities;
using Dapper;
using System.Data;

namespace Autosave.Api.Repositories
{
    public class AutosaveRepository : IAutosaveRepository
    {
        private readonly IDbConnection _db;

        public AutosaveRepository(IDbConnection db)
        {
            _db = db;
        }

        public async Task<int> UpsertAutosaveAsync(AutosaveData data)
        {
            var parameters = new DynamicParameters();
            parameters.Add("@Id", data.Id);
            parameters.Add("@Title", data.Title);
            parameters.Add("@Description", data.Description);
            parameters.Add("@IsAutosaved", data.IsAutosaved);
            parameters.Add("@NewId", dbType: DbType.Int32, direction: ParameterDirection.Output);

            await _db.ExecuteAsync(
                "usp_AutosaveData_Upsert",
                parameters,
                commandType: CommandType.StoredProcedure
            );

            return parameters.Get<int>("@NewId");
        }

        public async Task<IEnumerable<AutosaveData>> GetAllAsync()
        {
            var sql = "SELECT Id, Title, Description, DateCreated, Hits,IsAutosaved FROM AutosaveData ORDER BY DateCreated DESC";
            return await _db.QueryAsync<AutosaveData>(sql);
        }
        public async Task<AutosaveData?> GetByIdAsync(int id)
        {
            var sql = "SELECT Id, Title, Description, DateCreated, Hits,IsAutosaved FROM AutosaveData WHERE Id = @Id";
            return await _db.QueryFirstOrDefaultAsync<AutosaveData>(sql, new { Id = id });
        }

        public async Task ClearAllAsync()
        {
            var sql = "DELETE FROM AutosaveData";
            await _db.ExecuteAsync(sql);
        }

    }
}
