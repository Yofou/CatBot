package arguments

import com.kotlindiscord.kord.extensions.commands.converters.impl.string
import com.kotlindiscord.kord.extensions.commands.Arguments
import dev.kord.common.annotation.KordPreview

@KordPreview
class MhwHzv: Arguments() {
    val monsterName by string("monster_name", "Get hzv info for a specific monster")
}