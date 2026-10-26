#pragma once
#include "CoreMinimal.h"
#include "GameFramework/Character.h"
#include "BeninLifeCharacter.generated.h"

class USpringArmComponent;
class UCameraComponent;
class UBeninLifeWalletComponent;

UCLASS()
class BENINLIFE_API ABeninLifeCharacter : public ACharacter
{
    GENERATED_BODY()
public:
    ABeninLifeCharacter();
    virtual void SetupPlayerInputComponent(UInputComponent* PlayerInputComponent) override;
protected:
    virtual void BeginPlay() override;
private:
    UPROPERTY(VisibleAnywhere, Category="Camera") TObjectPtr<USpringArmComponent> CameraBoom;
    UPROPERTY(VisibleAnywhere, Category="Camera") TObjectPtr<UCameraComponent> FollowCamera;
    UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category="BENIN LIFE|Banking", meta=(AllowPrivateAccess="true"))
    TObjectPtr<UBeninLifeWalletComponent> Wallet;
    void MoveForward(float Value);
    void MoveRight(float Value);
    void Turn(float Value);
    void LookUp(float Value);
    void Interact();
};
