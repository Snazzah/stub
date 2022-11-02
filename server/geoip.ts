import { GeoIpDbName, open as openGeolite } from 'geolite2-redist';
import maxmind, { CityResponse, Reader } from 'maxmind';

import type { IpGeo } from '@/lib/types';

// @ts-expect-error bad typings
export let reader: geolite2.WrappedReader<Reader<CityResponse>>;

export async function openReader() {
  reader = await openGeolite(GeoIpDbName.City, (path) => maxmind.open<CityResponse>(path));
}

export function getGeo(ip?: string): IpGeo {
  const lookup = reader.get(ip) as CityResponse;
  if (!ip || !lookup)
    return {
      city: 'Userland',
      region: 'CA',
      country: 'US'
    };

  return {
    city: lookup.city?.names.en ?? lookup?.country?.names.en ?? 'Unknown',
    region: lookup.subdivisions?.[0]?.iso_code ?? lookup?.country?.names.en ?? 'Unknown',
    country: lookup.country?.iso_code ?? 'Unknown'
  };
}
