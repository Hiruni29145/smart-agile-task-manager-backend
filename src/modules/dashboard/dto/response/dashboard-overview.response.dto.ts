import { Type, Expose } from 'class-transformer';
import { TopCountryResponseDto } from './top-country-response.dto';
import { VisitorInsightDto } from './visitor-insight.dto';
import { TrafficSourceDto } from './traffic-source.dto';

export class DeviceTypeResponseDto {
    @Expose()
    desktop!: number;

    @Expose()
    mobile!: number;

    @Expose()
    tablet!: number;

    constructor(partial: Partial<DeviceTypeResponseDto>) {
        Object.assign(this, partial);
    }
}

export class DashboardOverviewResponseDto {
    @Expose()
    @Type(() => TopCountryResponseDto)
    countries!: TopCountryResponseDto[];

    @Expose()
    @Type(() => DeviceTypeResponseDto)
    deviceTypes!: DeviceTypeResponseDto;

    @Expose()
    @Type(() => VisitorInsightDto)
    visitorInsights!: VisitorInsightDto[];

    @Expose()
    @Type(() => TrafficSourceDto)
    trafficSources!: TrafficSourceDto[];

    constructor(partial: Partial<DashboardOverviewResponseDto>) {
        Object.assign(this, partial);
    }
}
