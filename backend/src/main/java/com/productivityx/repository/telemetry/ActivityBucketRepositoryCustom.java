package com.productivityx.repository.telemetry;

import com.productivityx.model.telemetry.ActivityBucket;
import java.util.List;

public interface ActivityBucketRepositoryCustom {
    int saveAllIgnoreConflict(List<ActivityBucket> buckets);
}
