import { NextApiRequest, NextApiResponse } from "next";
import { withProjectAuth } from "@/lib/auth";
import { redis } from "@/lib/redis";
import {
  intervalData,
  IntervalProps,
  processData,
  RawStatsProps,
} from "@/lib/stats";

export default withProjectAuth(
  async (req: NextApiRequest, res: NextApiResponse, project) => {
    if (req.method === "GET") {
      const { interval } = req.query as { interval: IntervalProps };
      const start = Date.now() - intervalData[interval || "24h"].milliseconds;
      const end = Date.now();

      let aggregatedData = {
        clicksData: [],
        deviceData: [],
        locationData: [],
        key: project.domain,
        refererData: [],
        totalClicks: 0,
      };

      // Weird workaround to get all keys from redis and collect data from each link
      let cursor = '0';
      do {
        const reply = await redis.scan(cursor, 'MATCH', `${process.env.REDIS_PREFIX}${project.domain}:clicks:*`, 'COUNT', 100);
        cursor = reply[0];
        const keys = reply[1];

        for (let key of keys) {
          key = key.replace(process.env.REDIS_PREFIX, '');
          const rawData = await redis
            .zrange(key, start, end, "BYSCORE")
            .then((r) => r.map((s) => JSON.parse(s)));
          const processedData = processData(project.domain, rawData, interval);

          // Aggregate data from each link
          aggregatedData.deviceData.push(...processedData.deviceData);
          aggregatedData.locationData.push(...processedData.locationData);
          aggregatedData.refererData.push(...processedData.refererData);
          aggregatedData.clicksData.push(...processedData.clicksData);
          aggregatedData.totalClicks += processedData.totalClicks;
        }
      } while (cursor !== '0');

      // Return the aggregated data
      return res.status(200).json(aggregatedData);
    } else {
      res.setHeader("Allow", ["GET"]);
      return res
        .status(405)
        .json({ error: `Method ${req.method} Not Allowed` });
    }
  }
);