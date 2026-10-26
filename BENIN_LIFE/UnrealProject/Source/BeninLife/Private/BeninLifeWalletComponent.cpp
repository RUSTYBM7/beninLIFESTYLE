#include "BeninLifeWalletComponent.h"

UBeninLifeWalletComponent::UBeninLifeWalletComponent()
{
    PrimaryComponentTick.bCanEverTick = false;
}

bool UBeninLifeWalletComponent::DepositCash(int64 AmountNaira)
{
    if (AmountNaira <= 0 || CashNaira < AmountNaira || BankNaira > MAX_int64 - AmountNaira) return false;
    CashNaira -= AmountNaira;
    BankNaira += AmountNaira;
    Record(TEXT("Cash deposit"), AmountNaira, EBeninLifeBankTransactionType::Deposit);
    BroadcastBalance();
    return true;
}

bool UBeninLifeWalletComponent::WithdrawCash(int64 AmountNaira)
{
    if (AmountNaira <= 0 || BankNaira < AmountNaira || CashNaira > MAX_int64 - AmountNaira) return false;
    BankNaira -= AmountNaira;
    CashNaira += AmountNaira;
    Record(TEXT("Cash withdrawal"), -AmountNaira, EBeninLifeBankTransactionType::Withdrawal);
    BroadcastBalance();
    return true;
}

bool UBeninLifeWalletComponent::SpendCash(int64 AmountNaira, const FString& Reason)
{
    if (AmountNaira <= 0 || CashNaira < AmountNaira) return false;
    CashNaira -= AmountNaira;
    Record(Reason.IsEmpty() ? TEXT("Purchase") : Reason, -AmountNaira, EBeninLifeBankTransactionType::Purchase);
    BroadcastBalance();
    return true;
}

void UBeninLifeWalletComponent::AddIncome(int64 AmountNaira, const FString& Reason)
{
    if (AmountNaira <= 0 || CashNaira > MAX_int64 - AmountNaira) return;
    CashNaira += AmountNaira;
    Record(Reason.IsEmpty() ? TEXT("Income") : Reason, AmountNaira, EBeninLifeBankTransactionType::Income);
    BroadcastBalance();
}

FString UBeninLifeWalletComponent::FormatNaira(int64 AmountNaira) const
{
    const FString Number = FText::AsNumber(AmountNaira).ToString();
    return FString::Printf(TEXT("\u20a6%s"), *Number);
}

void UBeninLifeWalletComponent::Record(const FString& Description, int64 AmountNaira, EBeninLifeBankTransactionType Type)
{
    FBeninLifeBankTransaction Entry;
    Entry.Description = Description;
    Entry.AmountNaira = AmountNaira;
    Entry.Type = Type;
    Entry.Timestamp = FDateTime::Now();
    RecentTransactions.Insert(Entry, 0);
    if (RecentTransactions.Num() > 30) RecentTransactions.SetNum(30);
}

void UBeninLifeWalletComponent::BroadcastBalance()
{
    OnWalletChanged.Broadcast(CashNaira, BankNaira);
}
