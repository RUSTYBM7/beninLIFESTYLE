#pragma once

#include "CoreMinimal.h"
#include "GameFramework/SaveGame.h"
#include "BeninLifeSaveGame.generated.h"

UCLASS()
class BENINLIFE_API UBeninLifeSaveGame : public USaveGame
{
	GENERATED_BODY()

public:
	UPROPERTY(VisibleAnywhere, Category="BENIN LIFE|Save")
	int32 SchemaVersion = 1;

	UPROPERTY(VisibleAnywhere, Category="BENIN LIFE|Save")
	FString PlayerDisplayName;

	UPROPERTY(VisibleAnywhere, Category="BENIN LIFE|Save")
	int64 CashNaira = 25000;

	UPROPERTY(VisibleAnywhere, Category="BENIN LIFE|Save")
	int64 BankNaira = 0;

	UPROPERTY(VisibleAnywhere, Category="BENIN LIFE|Save")
	int32 MinutesOfDay = 8 * 60;

	UPROPERTY(VisibleAnywhere, Category="BENIN LIFE|Save")
	int32 DayIndex = 1;

	UPROPERTY(VisibleAnywhere, Category="BENIN LIFE|Save")
	FString ActiveMissionId;

	UPROPERTY(VisibleAnywhere, Category="BENIN LIFE|Save")
	int32 MissionStepIndex = 0;

	UPROPERTY(VisibleAnywhere, Category="BENIN LIFE|Save")
	FVector PlayerLocation = FVector::ZeroVector;

	UPROPERTY(VisibleAnywhere, Category="BENIN LIFE|Save")
	FRotator PlayerRotation = FRotator::ZeroRotator;
};
