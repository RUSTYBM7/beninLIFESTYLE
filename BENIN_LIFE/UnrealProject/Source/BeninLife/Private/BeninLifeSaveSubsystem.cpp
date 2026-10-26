#include "BeninLifeSaveSubsystem.h"
#include "BeninLifeSaveGame.h"
#include "Kismet/GameplayStatics.h"

const FString UBeninLifeSaveSubsystem::SlotName = TEXT("BeninLifeSlot0");
const int32 UBeninLifeSaveSubsystem::UserIndex = 0;

bool UBeninLifeSaveSubsystem::SaveGame(int64 CashNaira, int64 BankNaira, int32 MinutesOfDay, int32 DayIndex,
	const FString& ActiveMissionId, int32 MissionStepIndex,
	FVector PlayerLocation, FRotator PlayerRotation, const FString& PlayerDisplayName)
{
	UBeninLifeSaveGame* Save = Cast<UBeninLifeSaveGame>(
		UGameplayStatics::CreateSaveGameObject(UBeninLifeSaveGame::StaticClass()));
	if (!Save) return false;

	Save->SchemaVersion = 1;
	Save->CashNaira = CashNaira;
	Save->BankNaira = BankNaira;
	Save->MinutesOfDay = MinutesOfDay;
	Save->DayIndex = DayIndex;
	Save->ActiveMissionId = ActiveMissionId;
	Save->MissionStepIndex = MissionStepIndex;
	Save->PlayerLocation = PlayerLocation;
	Save->PlayerRotation = PlayerRotation;
	Save->PlayerDisplayName = PlayerDisplayName;

	return UGameplayStatics::SaveGameToSlot(Save, SlotName, UserIndex);
}

UBeninLifeSaveGame* UBeninLifeSaveSubsystem::LoadGame()
{
	if (!DoesSaveExist()) return nullptr;
	return Cast<UBeninLifeSaveGame>(UGameplayStatics::LoadGameFromSlot(SlotName, UserIndex));
}

bool UBeninLifeSaveSubsystem::DoesSaveExist() const
{
	return UGameplayStatics::DoesSaveGameExist(SlotName, UserIndex);
}
