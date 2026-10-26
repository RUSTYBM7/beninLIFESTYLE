#pragma once

#include "CoreMinimal.h"
#include "Subsystems/GameInstanceSubsystem.h"
#include "BeninLifeTimeSubsystem.generated.h"

UCLASS()
class BENINLIFE_API UBeninLifeTimeSubsystem : public UGameInstanceSubsystem
{
	GENERATED_BODY()

public:
	virtual void Initialize(FSubsystemCollectionBase& Collection) override;

	UPROPERTY(BlueprintReadOnly, Category="BENIN LIFE|Time")
	int32 MinutesOfDay = 8 * 60;

	UPROPERTY(BlueprintReadOnly, Category="BENIN LIFE|Time")
	int32 DayIndex = 1;

	UFUNCTION(BlueprintCallable, Category="BENIN LIFE|Time")
	void AdvanceMinutes(int32 DeltaMinutes);

	UFUNCTION(BlueprintCallable, Category="BENIN LIFE|Time")
	void AdvanceHours(int32 Hours);

	UFUNCTION(BlueprintPure, Category="BENIN LIFE|Time")
	FString GetTimeString() const;

	UFUNCTION(BlueprintPure, Category="BENIN LIFE|Time")
	FString GetDayPhase() const;

	DECLARE_DYNAMIC_MULTICAST_DELEGATE_TwoParams(FOnBeninLifeTimeChanged, int32, MinutesOfDay, int32, DayIndex);
	UPROPERTY(BlueprintAssignable, Category="BENIN LIFE|Time")
	FOnBeninLifeTimeChanged OnTimeChanged;
};
