#pragma once

#include "CoreMinimal.h"
#include "UObject/Interface.h"
#include "BeninLifeInteractable.generated.h"

UINTERFACE(MinimalAPI, Blueprintable)
class UBeninLifeInteractable : public UInterface
{
	GENERATED_BODY()
};

class BENINLIFE_API IBeninLifeInteractable
{
	GENERATED_BODY()

public:
	UFUNCTION(BlueprintNativeEvent, BlueprintCallable, Category="BENIN LIFE|Interaction")
	FText GetInteractPrompt() const;

	UFUNCTION(BlueprintNativeEvent, BlueprintCallable, Category="BENIN LIFE|Interaction")
	void OnInteract(AActor* Interactor);
};
