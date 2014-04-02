define([], function()
{
	var IMG_DIR = '../img/cs/game/';
	var constants =
	{
		//define constants for the game grid's coordinates
		GRID_X : 0, GRID_Y : 0,
		GRID_Z: 42,
		POS_WIDTH   :64,

		//define the constants for the control block module
		MOVE_U  	: 0,
		MOVE_D  	: 1,
		MOVE_L  	: 2,
		MOVE_R  	: 3,
		MOVE_UR 	: 4,
		MOVE_RD 	: 5,
		MOVE_DL 	: 6,
		MOVE_LU 	: 7,
		TURN_L  	: 0,
		TURN_R      :  1,
		CB_DISTANCE : 42,  //distance from a block to the center

		//also shared by enemies
		BLOCK_RED   :  0,
		BLOCK_GREEN :  1,
		BLOCK_YELLOW:  2,
		BLOCK_BLUE  :  3,
		BLOCK_WIDTH : 37,

		//for enemy blocks and items coming in
		SHAFT_UP_LEFT : 0,
		SHAFT_UP_CENTER : 1,
		SHAFT_UP_RIGHT : 2,
		SHAFT_DOWN_LEFT : 3,
		SHAFT_DOWN_CENTER : 4,
		SHAFT_DOWN_RIGHT : 5,
		SHAFT_RIGHT_TOP : 6,
		SHAFT_RIGHT_CENTER : 7,
		SHAFT_RIGHT_BOTTOM : 8,
		SHAFT_LEFT_TOP : 9,
		SHAFT_LEFT_CENTER : 10,
		SHAFT_LEFT_BOTTOM : 11,
		GRID_TOP_LEFT : 0,
		GRID_TOP_CENTER : 1,
		GRID_TOP_RIGHT : 2,
		GRID_MID_LEFT : 3,
		GRID_MID_CENTER : 4,
		GRID_MID_RIGHT : 5,
		GRID_BOT_LEFT : 6,
		GRID_BOT_CENTER : 7,
		GRID_BOT_RIGHT : 8,

		ANIMS :
		{
			CEXPL_BLUE :
			{
				explode :
				{
					frameLength : 0.1,
					cycleTo     : 9,
					textures :  [  {url: IMG_DIR + 'cbbexp00.png'},
						{url: IMG_DIR + 'cbbexp01.png'},
						{url: IMG_DIR + 'cbbexp02.png'},
						{url: IMG_DIR + 'cbbexp03.png'},
						{url: IMG_DIR + 'cbbexp04.png'},
						{url: IMG_DIR + 'cbbexp05.png'},
						{url: IMG_DIR + 'cbbexp06.png'},
						{url: IMG_DIR + 'cbbexp07.png'},
						{url: IMG_DIR + 'cbbexp08.png'},
						{url: IMG_DIR + 'cbbexp09.png'}
					]
				},
				init : 'explode'
			},
			CEXPL_RED :
			{
				explode :
				{
					frameLength : 0.1,
					cycleTo     : 9,
					textures :  [
						{url: IMG_DIR + 'cbrexp00.png'},
						{url: IMG_DIR + 'cbrexp01.png'},
						{url: IMG_DIR + 'cbrexp02.png'},
						{url: IMG_DIR + 'cbrexp03.png'},
						{url: IMG_DIR + 'cbrexp04.png'},
						{url: IMG_DIR + 'cbrexp05.png'},
						{url: IMG_DIR + 'cbrexp06.png'},
						{url: IMG_DIR + 'cbrexp07.png'},
						{url: IMG_DIR + 'cbrexp08.png'},
						{url: IMG_DIR + 'cbrexp09.png'}
					]
				},
				init : 'explode'
			},
			CEXPL_YELLOW :
			{
				explode :
				{
					frameLength : 0.1,
					cycleTo     : 9,
					textures :  [
						{url: IMG_DIR + 'cbyexp00.png'},
						{url: IMG_DIR + 'cbyexp01.png'},
						{url: IMG_DIR + 'cbyexp02.png'},
						{url: IMG_DIR + 'cbyexp03.png'},
						{url: IMG_DIR + 'cbyexp04.png'},
						{url: IMG_DIR + 'cbyexp05.png'},
						{url: IMG_DIR + 'cbyexp06.png'},
						{url: IMG_DIR + 'cbyexp07.png'},
						{url: IMG_DIR + 'cbyexp08.png'},
						{url: IMG_DIR + 'cbyexp09.png'}
					]
				},
				init : 'explode'
			},
			CEXPL_GREEN :
			{
				explode :
				{
					frameLength : 0.1,
					cycleTo     : 9,
					textures :  [
						{url: IMG_DIR + 'cbgexp00.png'},
						{url: IMG_DIR + 'cbgexp01.png'},
						{url: IMG_DIR + 'cbgexp02.png'},
						{url: IMG_DIR + 'cbgexp03.png'},
						{url: IMG_DIR + 'cbgexp04.png'},
						{url: IMG_DIR + 'cbgexp05.png'},
						{url: IMG_DIR + 'cbgexp06.png'},
						{url: IMG_DIR + 'cbgexp07.png'},
						{url: IMG_DIR + 'cbgexp08.png'},
						{url: IMG_DIR + 'cbgexp09.png'}
					]
				},
				init : 'explode'
			}
		}
	};
	return constants;
});