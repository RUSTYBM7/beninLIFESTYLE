#pragma once

#include "CoreMinimal.h"
#include "Subsystems/GameInstanceSubsystem.h"
#include "BeninLifeMissionTypes.h"
#include "BeninLifeMissionSubsystem.generated.h"

UCLASS()
class BENINLIFE_API UBeninLifeMissionSubsystem : public UGameInstanceSubsystem
{
	GENERATED_BODY()

public:
	virtual void Initialize(FSubsystemCollectionBase& Collection) override;

	UPROPERTY(BlueprintReadOnly, Category="BENIN LIFE|Mission")
	FString ActiveMissionId;

	UPROPERTY(BlueprintReadOnly, Category="BENIN LIFE|Mission")
	int32 CurrentStepIndex = 0;

	UPROPERTY(BlueprintReadOnly, Category="BENIN LIFE|Mission")
	EBeninLifeMissionState State = EBeninLifeMissionState::Inactive;

	UFUNCTION(BlueprintCallable, Category="BENIN LIFE|Mission")
	bool StartMission(const FString& MissionId);

	UFUNCTION(BlueprintCallable, Category="BENIN LIFE|Mission")
	bool AdvanceStep(int64& OutRewardNaira);

	UFUNCTION(BlueprintPure, Category="BENIN LIFE|Mission")
	FText GetCurrentObjective() const;

	UFUNCTION(BlueprintCallable, Category="BENIN LIFE|Mission")
	void ResetMission();

private:
	UPROPERTY()
	TArray<FBeninLifeMissionDef> MissionCatalog;
};
