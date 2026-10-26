#include "BeninLifeMissionSubsystem.h"

void UBeninLifeMissionSubsystem::Initialize(FSubsystemCollectionBase& Collection)
{
	Super::Initialize(Collection);

	FBeninLifeMissionDef M;
	M.MissionId = TEXT("ikpoba_morning_errand");
	M.Title = FText::FromString(TEXT("Morning Errand \u2014 Ikpoba Hill"));

	FBeninLifeMissionStep S1;
	S1.StepId = TEXT("leave_compound");
	S1.ObjectiveText = FText::FromString(TEXT("Leave your compound and reach the roadside on Ikpoba Hill."));
	S1.TargetPoiId = TEXT("ikpoba_roadside");
	S1.RewardNaira = 0;
	M.Steps.Add(S1);

	FBeninLifeMissionStep S2;
	S2.StepId = TEXT("meet_contact");
	S2.ObjectiveText = FText::FromString(TEXT("Meet the contact near Ramat Park approach."));
	S2.TargetPoiId = TEXT("ramat_park_approach");
	S2.RewardNaira = 0;
	M.Steps.Add(S2);

	FBeninLifeMissionStep S3;
	S3.StepId = TEXT("deliver_package");
	S3.ObjectiveText = FText::FromString(TEXT("Deliver the package to the shop near the flyover."));
	S3.TargetPoiId = TEXT("flyover_shop");
	S3.RewardNaira = 3500;
	M.Steps.Add(S3);

	FBeninLifeMissionStep S4;
	S4.StepId = TEXT("return_home");
	S4.ObjectiveText = FText::FromString(TEXT("Return to your compound and rest."));
	S4.TargetPoiId = TEXT("ikpoba_compound");
	S4.RewardNaira = 500;
	M.Steps.Add(S4);

	MissionCatalog.Add(M);
}

bool UBeninLifeMissionSubsystem::StartMission(const FString& MissionId)
{
	for (const FBeninLifeMissionDef& Def : MissionCatalog)
	{
		if (Def.MissionId == MissionId)
		{
			ActiveMissionId = MissionId;
			CurrentStepIndex = 0;
			State = EBeninLifeMissionState::Active;
			return true;
		}
	}
	return false;
}

bool UBeninLifeMissionSubsystem::AdvanceStep(int64& OutRewardNaira)
{
	OutRewardNaira = 0;
	if (State != EBeninLifeMissionState::Active) return false;
	const FBeninLifeMissionDef* Def = nullptr;
	for (const FBeninLifeMissionDef& D : MissionCatalog)
	{
		if (D.MissionId == ActiveMissionId) { Def = &D; break; }
	}
	if (!Def || !Def->Steps.IsValidIndex(CurrentStepIndex)) return false;
	OutRewardNaira = Def->Steps[CurrentStepIndex].RewardNaira;
	CurrentStepIndex++;
	if (CurrentStepIndex >= Def->Steps.Num()) State = EBeninLifeMissionState::Completed;
	return true;
}

FText UBeninLifeMissionSubsystem::GetCurrentObjective() const
{
	if (State != EBeninLifeMissionState::Active) return FText::GetEmpty();
	for (const FBeninLifeMissionDef& D : MissionCatalog)
	{
		if (D.MissionId == ActiveMissionId && D.Steps.IsValidIndex(CurrentStepIndex))
			return D.Steps[CurrentStepIndex].ObjectiveText;
	}
	return FText::GetEmpty();
}

void UBeninLifeMissionSubsystem::ResetMission()
{
	ActiveMissionId.Reset();
	CurrentStepIndex = 0;
	State = EBeninLifeMissionState::Inactive;
}
