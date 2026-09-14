from app import winner
import unittest

class TestWinner(unittest.TestCase):
    def test_case_1(self):
        """(12,0)->A"""
        self.assertEqual(winner(12, 0), 'A')
    
    def test_case_2(self):
        """(0,12)->B"""
        self.assertEqual(winner(0, 12), 'B')
    
    def test_case_3(self):
        """(12,13)->A"""
        self.assertEqual(winner(12, 13), 'A')
    
    def test_case_4(self):
        """(0,0)->None"""
        self.assertIsNone(winner(0, 0))
    
    def test_case_5(self):
        """(11,11)->None"""
        self.assertIsNone(winner(11, 11))

if __name__ == '__main__':
    unittest.main()