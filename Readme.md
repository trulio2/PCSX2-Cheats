### Valkyrie Profile 2: Silmeria [SLUS-21452 CC96CE93]

Save File Corruption 1073B8E5

- The save file breaking was not a joke. If the anticheat finds any modifications, the game will set some flags during cutscenes and mid battle, and if you manage to save while these flags are set (that should be a rare problem, since the game will freeze before you're able to finish saving it), the game will catch these flags and will freeze/bug out during battles (you'll get a weird bug where the victory screen doesnt show up, just like in some boss fights)
- Even if you're not using any cheats or modified items/characters, if these flags are corrupted, the game will crash eventually
- Fixed the freezes before and after battle and victory screen bug. Need more tests for side effects
- Going to battle with cheats enabled and without an anticheat will mess with dozens of flags, so there could still be even more problems hidden somewhere
- This problem is "rare", since it'll only happen if you're using cheats with an incomplete anticheat (that will stop the freezes, but not the corruption of flags), or if you're manually breaking these freezes directly in the debugger

In-Battle checksum verification

- Seems to be fine for now, but there are literally hundreds of validations happening in many different places during battle. Will need more tests to be certain that it's all fixed

More than 36 characters (probably not possible)

- There's a hardcoded limit of 36 characters in the team at the same time
- (limit of 21 003B5E58) (creating slots 003D7734 003D77C0 003D7E40) (empty slot 358FF46B) 0030099C 003D8044

Playable enemy

- 002F8D68 hints here (358FF40F 358FF46B)

Tutorial for how to use it

[![](https://img.youtube.com/vi/7N0e_fsYdbw/hqdefault.jpg)](https://youtu.be/7N0e_fsYdbw)
