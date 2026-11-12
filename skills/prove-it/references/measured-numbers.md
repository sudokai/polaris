# Measured numbers

Use this checklist for performance comparisons and measurements that support a choice between implementations or configurations.

Before running, state the claim, metric, dataset, and conditions. Name the decision that depends on the result. Read the measurement script to identify what it times, counts, and excludes.

For a requested rough estimate, one run is enough. Label it as a single run, check for errors, and confirm that the work ran. Use the full checklist when comparing options or claiming a measurable difference.

## Check the measurement

1. **Confirm completed, correct work.** Count errors, rejections, timeouts, retries, and unsuccessful responses. Validate the output and ensure that results were consumed. Check for lazy work, missing awaits, and code outside the timed region.

2. **Match the conditions.** Use equivalent release builds, flags, versions, data, caches, concurrency, connection pools, and transaction settings. If tuning differs, the result describes the configurations rather than the implementations.

3. **Check the environment.** Record system load and available CPUs. Alternate baseline and treatment runs so both experience similar conditions. Check whether the load generator hits its own limit before the system under test does. Profile separately because profiling changes performance.

4. **Check physical limits.** Compare throughput with disk and network bandwidth, operation costs with CPU capacity, and time saved with time spent in the changed code. Investigate impossible results for caching, skipped work, errors, or a broken measurement.

5. **Repeat the comparison.** Run each side at least five times, alternating baseline and treatment. Report the median and range. Use a statistical test that matches the experimental design when the decision is close. Report `INCONCLUSIVE` when noise prevents a decision, and do not treat that result as proof of equivalence.

6. **Measure the user path.** Use realistic data and concurrency. Report a microbenchmark as a share of the end-to-end operation. A helper that accounts for 1% of a request cannot make that request more than 1% faster by itself.

## Report the result

Lead with faster, slower, no measurable difference within a stated margin, or inconclusive.

Include the primary number, unit, run count, range, conditions, and bottleneck when known. For example:

> Median latency was 41 ms before and 33 ms after across 7 alternating runs per side. The treatment range was 32 to 35 ms. JSON parsing on one core was the bottleneck.

If the bottleneck is unknown, report that limitation without inventing an explanation. Name any unequal conditions, correctness gaps, or incomplete work that make the result inconclusive.
