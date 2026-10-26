#include "BeninLifeCharacter.h"
#include "BeninLifeWalletComponent.h"
#include "Camera/CameraComponent.h"
#include "Components/CapsuleComponent.h"
#include "Components/InputComponent.h"
#include "GameFramework/CharacterMovementComponent.h"
#include "GameFramework/Controller.h"
#include "GameFramework/SpringArmComponent.h"
#include "Engine/World.h"
#include "DrawDebugHelpers.h"

ABeninLifeCharacter::ABeninLifeCharacter()
{
    PrimaryActorTick.bCanEverTick = false;
    GetCapsuleComponent()->InitCapsuleSize(42.f, 96.f);
    bUseControllerRotationPitch = false;
    bUseControllerRotationYaw = false;
    bUseControllerRotationRoll = false;
    GetCharacterMovement()->bOrientRotationToMovement = true;
    GetCharacterMovement()->RotationRate = FRotator(0.f, 540.f, 0.f);
    GetCharacterMovement()->JumpZVelocity = 500.f;
    GetCharacterMovement()->AirControl = 0.25f;

    CameraBoom = CreateDefaultSubobject<USpringArmComponent>(TEXT("CameraBoom"));
    CameraBoom->SetupAttachment(RootComponent);
    CameraBoom->TargetArmLength = 320.f;
    CameraBoom->bUsePawnControlRotation = true;
    FollowCamera = CreateDefaultSubobject<UCameraComponent>(TEXT("FollowCamera"));
    FollowCamera->SetupAttachment(CameraBoom, USpringArmComponent::SocketName);
    FollowCamera->bUsePawnControlRotation = false;

    Wallet = CreateDefaultSubobject<UBeninLifeWalletComponent>(TEXT("InGameWallet"));
}

void ABeninLifeCharacter::BeginPlay() { Super::BeginPlay(); }

void ABeninLifeCharacter::SetupPlayerInputComponent(UInputComponent* PlayerInputComponent)
{
    Super::SetupPlayerInputComponent(PlayerInputComponent);
    check(PlayerInputComponent);
    PlayerInputComponent->BindAxis("MoveForward", this, &ABeninLifeCharacter::MoveForward);
    PlayerInputComponent->BindAxis("MoveRight", this, &ABeninLifeCharacter::MoveRight);
    PlayerInputComponent->BindAxis("Turn", this, &ABeninLifeCharacter::Turn);
    PlayerInputComponent->BindAxis("LookUp", this, &ABeninLifeCharacter::LookUp);
    PlayerInputComponent->BindAction("Jump", IE_Pressed, this, &ACharacter::Jump);
    PlayerInputComponent->BindAction("Jump", IE_Released, this, &ACharacter::StopJumping);
    PlayerInputComponent->BindAction("Interact", IE_Pressed, this, &ABeninLifeCharacter::Interact);
}

void ABeninLifeCharacter::MoveForward(float Value)
{
    if (Controller && FMath::Abs(Value) > KINDA_SMALL_NUMBER)
        AddMovementInput(FRotationMatrix(FRotator(0.f, Controller->GetControlRotation().Yaw, 0.f)).GetUnitAxis(EAxis::X), Value);
}
void ABeninLifeCharacter::MoveRight(float Value)
{
    if (Controller && FMath::Abs(Value) > KINDA_SMALL_NUMBER)
        AddMovementInput(FRotationMatrix(FRotator(0.f, Controller->GetControlRotation().Yaw, 0.f)).GetUnitAxis(EAxis::Y), Value);
}
void ABeninLifeCharacter::Turn(float Value) { AddControllerYawInput(Value); }
void ABeninLifeCharacter::LookUp(float Value) { AddControllerPitchInput(Value); }
void ABeninLifeCharacter::Interact()
{
    if (!GetWorld()) return;
    const FVector Start = FollowCamera->GetComponentLocation();
    const FVector End = Start + FollowCamera->GetForwardVector() * 350.f;
    FHitResult Hit;
    FCollisionQueryParams Params(SCENE_QUERY_STAT(BeninLifeInteract), false, this);
    if (GetWorld()->LineTraceSingleByChannel(Hit, Start, End, ECC_Visibility, Params))
        DrawDebugPoint(GetWorld(), Hit.ImpactPoint, 12.f, FColor::Green, false, 1.0f);
}
