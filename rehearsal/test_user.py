import unittest
from app import winner


class TestWinner(unittest.TestCase):
    def test_a_wins_low(self):
        self.assertEqual(winner(12, 0), 'A')

    def test_b_wins_low(self):
        self.assertEqual(winner(0, 12), 'B')

    def test_a_wins_extra(self):
        self.assertEqual(winner(12, 13), 'A')

    def test_zero_zero(self):
        self.assertIsNone(winner(0, 0))

    def test_neither_reaches(self):
        self.assertIsNone(winner(11, 11))


if __name__ == '__main__':
    unittest.main()