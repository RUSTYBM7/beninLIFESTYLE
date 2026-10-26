#!/usr/bin/env python3
"""Unit tests for fictional naira wallet rules (Master Spec §10)."""
import unittest

class Wallet:
    def __init__(self, cash=25000, bank=0):
        self.cash = int(cash)
        self.bank = int(bank)
        self.ledger = []

    def _record(self, desc, amount, typ):
        self.ledger.append({"desc": desc, "amount": amount, "type": typ})

    def deposit(self, amount):
        amount = int(amount)
        if amount <= 0 or amount > self.cash:
            return False
        self.cash -= amount
        self.bank += amount
        self._record("Deposit", amount, "Deposit")
        return True

    def withdraw(self, amount):
        amount = int(amount)
        if amount <= 0 or amount > self.bank:
            return False
        self.bank -= amount
        self.cash += amount
        self._record("Withdrawal", amount, "Withdrawal")
        return True

    def spend(self, amount, reason="Purchase"):
        amount = int(amount)
        if amount <= 0 or amount > self.cash:
            return False
        self.cash -= amount
        self._record(reason, -amount, "Purchase")
        return True

    def income(self, amount, reason="Income"):
        amount = int(amount)
        if amount <= 0:
            return False
        self.cash += amount
        self._record(reason, amount, "Income")
        return True


class TestNairaWallet(unittest.TestCase):
    def test_start_balances(self):
        w = Wallet()
        self.assertEqual(w.cash, 25000)
        self.assertEqual(w.bank, 0)

    def test_deposit_ok(self):
        w = Wallet()
        self.assertTrue(w.deposit(5000))
        self.assertEqual(w.cash, 20000)
        self.assertEqual(w.bank, 5000)

    def test_deposit_insufficient(self):
        w = Wallet(cash=100)
        self.assertFalse(w.deposit(500))

    def test_withdraw_ok(self):
        w = Wallet(cash=0, bank=10000)
        self.assertTrue(w.withdraw(3000))
        self.assertEqual(w.cash, 3000)
        self.assertEqual(w.bank, 7000)

    def test_spend_and_income(self):
        w = Wallet()
        self.assertTrue(w.spend(1500, "Okada"))
        self.assertEqual(w.cash, 23500)
        self.assertTrue(w.income(3500, "Errand pay"))
        self.assertEqual(w.cash, 27000)

    def test_no_float(self):
        w = Wallet()
        w.deposit(100)
        self.assertIsInstance(w.cash, int)
        self.assertIsInstance(w.bank, int)

    def test_negative_rejected(self):
        w = Wallet()
        self.assertFalse(w.deposit(-1))
        self.assertFalse(w.spend(0))
        self.assertFalse(w.income(-50))


if __name__ == "__main__":
    unittest.main()
