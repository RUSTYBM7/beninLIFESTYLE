#pragma once

#include "CoreMinimal.h"
#include "BeninLifeMissionTypes.generated.h"

UENUM(BlueprintType)
enum class EBeninLifeMissionState : uint8
{
	Inactive,
	Active,
	Completed,
	Failed
};

USTRUCT(BlueprintType)
struct FBeninLifeMissionStep
{
	GENERATED_BODY()

	UPROPERTY(EditAnywhere, BlueprintReadOnly, Category="BENIN LIFE|Mission")
	FString StepId;

	UPROPERTY(EditAnywhere, BlueprintReadOnly, Category="BENIN LIFE|Mission")
	FText ObjectiveText;

	UPROPERTY(EditAnywhere, BlueprintReadOnly, Category="BENIN LIFE|Mission")
	FString TargetPoiId;

	UPROPERTY(EditAnywhere, BlueprintReadOnly, Category="BENIN LIFE|Mission")
	int64 RewardNaira = 0;
};

USTRUCT(BlueprintType)
struct FBeninLifeMissionDef
{
	GENERATED_BODY()

	UPROPERTY(EditAnywhere, BlueprintReadOnly, Category="BENIN LIFE|Mission")
	FString MissionId;

	UPROPERTY(EditAnywhere, BlueprintReadOnly, Category="BENIN LIFE|Mission")
	FText Title;

	UPROPERTY(EditAnywhere, BlueprintReadOnly, Category="BENIN LIFE|Mission")
	TArray<FBeninLifeMissionStep> Steps;
};
