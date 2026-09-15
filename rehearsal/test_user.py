import unittest
from app import winner


class TestWinner(unittest.TestCase):

    def test_twelve_zero_returns_a(self):
        self.assertEqual(winner(12, 0), "A")

    def test_zero_twelve_returns_b(self):
        self.assertEqual(winner(0, 12), "B")

    def test_twelve_thirteen_returns_a(self):
        self.assertEqual(winner(12, 13), "A")

    def test_zero_zero_returns_none(self):
        self.assertIsNone(winner(0, 0))

    def test_eleven_eleven_returns_none(self):
        self.assertIsNone(winner(11, 11))


if __name__ == '__main__':
    unittest.main()