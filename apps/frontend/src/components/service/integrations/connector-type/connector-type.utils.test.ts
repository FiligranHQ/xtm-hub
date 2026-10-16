import {
  CONNECTOR_TYPE_ICONS,
  CONNECTOR_TYPES,
  getConnectorTypeIcon,
  getHuntPlatformName,
  HUNT_PLATFORM_NAMES,
  humanizeIdentifier,
  isConnectorType,
  isHuntPlatform,
  UNKNOWN_CONNECTOR_TYPE_ICON,
} from '@/components/service/integrations/connector-type/connector-type.utils';
import { ICON_NAMES } from '@filigran/design-system';
import { describe, expect, it } from 'vitest';

describe('connector-type.utils', () => {
  it('only uses icon names of the design system vocabulary', () => {
    const icons = [
      ...Object.values(CONNECTOR_TYPE_ICONS),
      UNKNOWN_CONNECTOR_TYPE_ICON,
    ];

    for (const icon of icons) {
      expect(ICON_NAMES).toContain(icon);
    }
  });

  it('lists the hunt connector type', () => {
    expect(CONNECTOR_TYPES).toContain('INTERNAL_HUNT');
  });

  it.each`
    value               | expected
    ${'INTERNAL_HUNT'}  | ${true}
    ${'STREAM'}         | ${true}
    ${'internal_hunt'}  | ${false}
    ${'INTERNAL_HUNTS'} | ${false}
    ${null}             | ${false}
    ${undefined}        | ${false}
  `('isConnectorType($value) is $expected', ({ value, expected }) => {
    expect(isConnectorType(value)).toBe(expected);
  });

  it('uses the crosshair icon for hunt connectors and a generic icon for unknown types', () => {
    expect(getConnectorTypeIcon('INTERNAL_HUNT')).toBe('locate-fixed');
    expect(getConnectorTypeIcon('INTERNAL_INGESTION')).toBe(
      UNKNOWN_CONNECTOR_TYPE_ICON
    );
  });

  it.each`
    value                   | expected
    ${'splunk'}             | ${true}
    ${'microsoft-sentinel'} | ${true}
    ${'microsoft-defender'} | ${true}
    ${'sentinelone'}        | ${true}
    ${'internet'}           | ${false}
    ${'qradar'}             | ${false}
    ${null}                 | ${false}
  `('isHuntPlatform($value) is $expected', ({ value, expected }) => {
    expect(isHuntPlatform(value)).toBe(expected);
  });

  it('names every hunted platform exactly as the OpenCTI hunt screens do', () => {
    expect(HUNT_PLATFORM_NAMES).toEqual({
      splunk: 'Splunk',
      'microsoft-sentinel': 'Microsoft Sentinel',
      'microsoft-defender': 'Microsoft Defender XDR',
      'elastic-security': 'Elastic Security',
      'crowdstrike-logscale': 'CrowdStrike Falcon LogScale',
      'google-secops': 'Google SecOps',
      opensearch: 'OpenSearch',
      clickhouse: 'ClickHouse',
      's3-ocsf': 'Amazon S3 (OCSF)',
      sentinelone: 'SentinelOne Singularity',
    });
  });

  it.each`
    value              | expected
    ${'google-secops'} | ${'Google SecOps'}
    ${'s3-ocsf'}       | ${'Amazon S3 (OCSF)'}
    ${'ibm-qradar'}    | ${'Ibm qradar'}
  `('getHuntPlatformName($value) is "$expected"', ({ value, expected }) => {
    expect(getHuntPlatformName(value)).toBe(expected);
  });

  it.each`
    value                   | expected
    ${'INTERNAL_INGESTION'} | ${'Internal ingestion'}
    ${'ibm-qradar'}         | ${'Ibm qradar'}
    ${'  SOME__TYPE  '}     | ${'Some type'}
  `('humanizes "$value" as "$expected"', ({ value, expected }) => {
    expect(humanizeIdentifier(value)).toBe(expected);
  });
});
