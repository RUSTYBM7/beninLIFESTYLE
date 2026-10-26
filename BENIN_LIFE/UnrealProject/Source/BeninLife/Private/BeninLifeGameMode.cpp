#include "BeninLifeGameMode.h"
#include "BeninLifeCharacter.h"

ABeninLifeGameMode::ABeninLifeGameMode()
{
    DefaultPawnClass = ABeninLifeCharacter::StaticClass();
}
