#include "BeninLifeTimeSubsystem.h"

void UBeninLifeTimeSubsystem::Initialize(FSubsystemCollectionBase& Collection)
{
	Super::Initialize(Collection);
	MinutesOfDay = 8 * 60;
	DayIndex = 1;
}

void UBeninLifeTimeSubsystem::AdvanceMinutes(int32 DeltaMinutes)
{
	if (DeltaMinutes <= 0) return;
	MinutesOfDay += DeltaMinutes;
	while (MinutesOfDay >= 1440)
	{
		MinutesOfDay -= 1440;
		DayIndex++;
	}
	OnTimeChanged.Broadcast(MinutesOfDay, DayIndex);
}

void UBeninLifeTimeSubsystem::AdvanceHours(int32 Hours)
{
	AdvanceMinutes(Hours * 60);
}

FString UBeninLifeTimeSubsystem::GetTimeString() const
{
	const int32 H = MinutesOfDay / 60;
	const int32 M = MinutesOfDay % 60;
	return FString::Printf(TEXT("%02d:%02d"), H, M);
}

FString UBeninLifeTimeSubsystem::GetDayPhase() const
{
	if (MinutesOfDay < 5 * 60) return TEXT("Night");
	if (MinutesOfDay < 12 * 60) return TEXT("Morning");
	if (MinutesOfDay < 17 * 60) return TEXT("Afternoon");
	if (MinutesOfDay < 20 * 60) return TEXT("Evening");
	return TEXT("Night");
}
