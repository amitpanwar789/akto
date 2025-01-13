package com.akto.dao.testing;

import java.util.List;

import org.bson.conversions.Bson;
import org.bson.types.ObjectId;

import com.akto.dao.MCollection;
import com.akto.dao.context.Context;
import com.akto.dto.ApiInfo.ApiInfoKey;
import com.akto.dto.testing.GenericTestResult;
import com.akto.dto.testing.TestingRunResult;
import com.akto.dto.testing.TestingRunResultSummary;
import com.akto.util.Constants;
import com.mongodb.client.model.CreateCollectionOptions;
import com.mongodb.client.model.Filters;
import com.mongodb.client.model.Projections;

public class VulnerableTestingRunResultDao extends TestingRunResultDao {

    public static final VulnerableTestingRunResultDao instance = new VulnerableTestingRunResultDao();

    @Override
    public void createIndicesIfAbsent() {
        
        String dbName = Context.accountId.get()+"";

        CreateCollectionOptions createCollectionOptions = new CreateCollectionOptions();
        createCollectionIfAbsent(dbName, getCollName(), createCollectionOptions);

        
        MCollection.createIndexIfAbsent(getDBName(), getCollName(),
                new String[] { TestingRunResult.TEST_RUN_RESULT_SUMMARY_ID }, false);
        
        String[] fieldNames = new String[]{TestingRunResult.TEST_RUN_RESULT_SUMMARY_ID, TestingRunResult.TEST_RESULTS+"."+GenericTestResult._CONFIDENCE};
        MCollection.createIndexIfAbsent(getDBName(), getCollName(), fieldNames, false);

        fieldNames = new String[]{TestingRunResult.TEST_RUN_RESULT_SUMMARY_ID, TestingRunResult.TEST_SUPER_TYPE};
        MCollection.createIndexIfAbsent(getDBName(), getCollName(), fieldNames, false);

        fieldNames = new String[]{TestingRunResult.TEST_RUN_RESULT_SUMMARY_ID, TestingRunResult.API_INFO_KEY, TestingRunResult.TEST_SUB_TYPE};
        MCollection.createIndexIfAbsent(getDBName(), getCollName(), fieldNames, false);
    }

    public boolean isStoredInVulnerableCollection(ObjectId objectId, boolean isSummary){
        if(!isSummary){
            return TestingRunDao.instance.isStoredInVulnerableCollection(objectId);
        }else {
            try {
                Bson filter = Filters.and(
                    Filters.eq(Constants.ID, objectId),
                    Filters.eq(TestingRunResultSummary.IS_NEW_TESTING_RUN_RESULT_SUMMARY, true)
                );
                boolean isNew = TestingRunResultSummariesDao.instance.count(filter) > 0;
                if(!isNew){
                    TestingRunResultSummary trrs = TestingRunResultSummariesDao.instance.findOne(
                        Filters.eq(Constants.ID, objectId),
                        Projections.include(TestingRunResultSummary.TESTING_RUN_ID)
                    );
                    return TestingRunDao.instance.isStoredInVulnerableCollection(trrs.getTestingRunId());
                }else{
                    return isNew;
                }
            } catch (Exception e) {
                e.printStackTrace();
                return false;
            }
        }
    }

    public int countFromDb(Bson filter, boolean isVulnerable){
        if(isVulnerable){
            int count = (int) instance.count(filter);
            if(count != 0){
                return count;
            }
        }
        return (int) TestingRunResultDao.instance.count(filter);
    }

    public List<TestingRunResult> fetchLatestTestingRunResultWithCustomAggregations(Bson filters, int limit, int skip, Bson customSort, ObjectId summaryId, boolean isVulnerable) {
        if(isVulnerable && instance.isStoredInVulnerableCollection(summaryId, true)){
            return instance.fetchLatestTestingRunResultWithCustomAggregations(filters, limit, skip, customSort);
        }else{
            return TestingRunResultDao.instance.fetchLatestTestingRunResultWithCustomAggregations(filters, limit, skip, customSort);
        }
    }

    public TestingRunResult findOne(Bson q, Bson projection) {
        TestingRunResult tr = TestingRunResultDao.instance.findOne(q, projection);
        if(tr == null){
            return super.findOne(q, projection);
        }
        return tr;
    }

    public List<TestingRunResult> findAll(Bson q, Bson projection, boolean isStoredInVulnerableCollection) {
        if(isStoredInVulnerableCollection){
            return instance.findAll(q,projection);
        }
        return TestingRunResultDao.instance.findAll(q, projection);
    }

    @Override
    public String getCollName() {
        return "vulnerable_testing_run_results";
    }
}
