import unittest
from app import winner


class TestWinner(unittest.TestCase):
    def test_case_1(self):
        self.assertEqual(winner(12, 0), 'A')
    
    def test_case_2(self):
        self.assertEqual(winner(0, 12), 'B')
    
    def test_case_3(self):
        self.assertEqual(winner(12, 13), 'A')
    
    def test_case_4(self):
        self.assertIsNone(winner(0, 0))
    
    def test_case_5(self):
        self.assertIsNone(winner(11, 11))


if __name__ == '__main__':
    unittest.main()