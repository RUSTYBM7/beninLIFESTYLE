#pragma once

#include "CoreMinimal.h"
#include "Subsystems/GameInstanceSubsystem.h"
#include "BeninLifeSaveSubsystem.generated.h"

class UBeninLifeSaveGame;

UCLASS()
class BENINLIFE_API UBeninLifeSaveSubsystem : public UGameInstanceSubsystem
{
	GENERATED_BODY()

public:
	static const FString SlotName;
	static const int32 UserIndex;

	UFUNCTION(BlueprintCallable, Category="BENIN LIFE|Save")
	bool SaveGame(int64 CashNaira, int64 BankNaira, int32 MinutesOfDay, int32 DayIndex,
		const FString& ActiveMissionId, int32 MissionStepIndex,
		FVector PlayerLocation, FRotator PlayerRotation, const FString& PlayerDisplayName);

	UFUNCTION(BlueprintCallable, Category="BENIN LIFE|Save")
	UBeninLifeSaveGame* LoadGame();

	UFUNCTION(BlueprintPure, Category="BENIN LIFE|Save")
	bool DoesSaveExist() const;
};
